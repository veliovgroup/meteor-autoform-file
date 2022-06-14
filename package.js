Package.describe({
  name: 'ostrio:autoform-files',
  summary: 'File upload for AutoForm using ostrio:files',
  description: 'File upload for AutoForm using ostrio:files',
  version: '2.5.0',
  git: 'https://github.com/veliovgroup/meteor-autoform-file.git'
});

Package.onUse((api) => {
  api.versionsFrom('METEOR@2.0');

  api.use([
    'check',
    'ecmascript',
    'mongo',
    'reactive-var',
    'templating@1.4.2',
    'aldeed:autoform@7.0.0',
    'ostrio:files@2.1.1'
  ], 'client');

  api.addFiles([
    'lib/client/autoform.js',
    'lib/client/fileUpload.html',
    'lib/client/fileUpload.js',
    'lib/client/uploadImageDemo.html',
    'lib/client/uploadFileDemo.html'
  ], 'client');
});
