'use strict';

var fs = require('fs');
var path = require('path');
var os = require('os');
var notifier = require('node-notifier');
var File = require('vinyl');
var chalk = require('chalk');
var gutil = require('gulp-util');
var fs = require('fs-extra')
var mkpath = require('mkpath');
var uuid = require('uuid');
var exec = require('child_process').exec;
var format = require('string-format');
format.extend(String.prototype);

var clobber_dir_name = '.clobber';
var cmd_sr_build = 'java -jar ScriptRunner.jar -build {0} -label {1} -outfile {2} -logdir {3}';
var cmd_sr_run = 'java -jar ScriptRunner.jar -run {0} -jdbc {1} -user {2} -password {3} -logdir {4}';

function logSuccess(message) {
  gutil.log(chalk.green('Success: ') + message);
  notifier.notify({
    'title': 'Successfully Clobbed',
    'message': message,
    'icon': path.join(__dirname, 'success.jpg')
  });
};

function logFailure(message) {
  gutil.log(chalk.red('Failure: ') + message);
  notifier.notify({
    'title': 'Failed to Clob',
    'message': message,
    'icon': path.join(__dirname, 'failure.jpg')
  });
};

module.exports = function(changed_file) {

  var runid = uuid.v1();

  var config;
  try {
    config = JSON.parse(fs.readFileSync('gulp-clobber.json', 'utf8'));
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new gutil.PluginError('gulp-clobber', 'Failed to load ' + chalk.blue('gulp-clobber.json') + ' due to syntax error.');
    }
  }

  var file = new File({
    cwd: process.cwd(),
    path: changed_file.path
  });
  file.name = file.path.replace(/^.*[\\\/]/, '');
  file.dirnamerelative = file.relative.replace('/' + file.name, '');

  var target_working_dir = path.join(clobber_dir_name, runid);
  var target_build_dir = path.join(target_working_dir, 'build');

  fs.mkdirsSync(path.join(target_build_dir, file.dirnamerelative));
  fs.copySync(file.relative, path.join(target_build_dir, file.relative));
  fs.copySync('ScriptRunner', path.join(target_build_dir, 'ScriptRunner'));
  fs.emptyDirSync(path.join(target_build_dir, 'ScriptRunner', 'Utils'));
  fs.rmdirSync(path.join(target_build_dir, 'ScriptRunner', 'Utils'));
  fs.emptyDirSync(path.join(target_build_dir, 'ScriptRunner', 'Jobs'));
  fs.rmdirSync(path.join(target_build_dir, 'ScriptRunner', 'Jobs'));

  var build_label = 'clobber-{0}-{1}'.format(os.hostname(), runid);
  var build_cmd = cmd_sr_build.format(target_build_dir, build_label, path.join(target_working_dir, build_label + '.zip'), target_working_dir);
  var run_cmd = cmd_sr_run.format(path.join(target_working_dir, build_label + '.zip'), config.scriptrunner.jdbc, config.scriptrunner.user, config.scriptrunner.password, target_working_dir);

  exec(build_cmd, function(err) {
    if (err) {
      logFailure(file.relative + ' was not clobbed.' + err);
      return;
    }

    exec(run_cmd, function(err) {
      if (err) {
        logFailure(file.relative + ' was not clobbed. Check ScriptRunner log in ' + target_working_dir + ' for more details. ' + err);
        return;
      }
      fs.emptyDirSync(target_working_dir);
      fs.rmdirSync(target_working_dir);
      logSuccess(file.relative + ' was clobbed.');
    });
  });
};
