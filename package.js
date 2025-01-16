Package.describe({
  name: 'ostrio:autoform-files',
  summary: 'File upload for AutoForm using ostrio:files',
  description: 'File upload for AutoForm using ostrio:files',
  version: '3.0.0-beta.0',
  git: 'https://github.com/veliovgroup/meteor-autoform-file.git'
});

Package.onUse((api) => {
  api.versionsFrom(['2.16', '3.0.1']);

  api.use([
    'check',
    'ecmascript',
    'mongo',
    'reactive-var',
    'templating@1.4.4',
    'aldeed:autoform@7.0.0 || 8.0.0',
    'ostrio:files@2.0.0 || 3.0.0-beta.6'
  ], 'client');

  api.addFiles([
    'lib/client/autoform.js',
    'lib/client/fileUpload.html',
    'lib/client/fileUpload.js',
    'lib/client/uploadImageDemo.html',
    'lib/client/uploadFileDemo.html'
  ], 'client');
});
