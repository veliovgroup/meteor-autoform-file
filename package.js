Package.describe({
  name: 'ostrio:autoform-files',
  summary: 'File upload for AutoForm using ostrio:files',
  description: 'File upload for AutoForm using ostrio:files',
  version: '2.3.0',
  git: 'https://github.com/VeliovGroup/meteor-autoform-file.git'
});

Package.onUse((api) => {
  api.versionsFrom('METEOR@1.9');

  api.use([
    'check',
    'ecmascript',
    'mongo',
    'reactive-var',
    'templating@1.3.2',
    'aldeed:autoform@6.3.0',
    'ostrio:files@1.14.0'
  ], 'client');

  api.addFiles([
    'lib/client/autoform.js',
    'lib/client/fileUpload.html',
    'lib/client/fileUpload.js',
    'lib/client/uploadImageDemo.html',
    'lib/client/uploadFileDemo.html'
  ], 'client');
});
