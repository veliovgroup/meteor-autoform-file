import { AutoForm } from 'meteor/aldeed:autoform';

AutoForm.addInputType('fileUpload', {
  template: 'afFileUpload',
  valueOut() {
    return this.val();
  }
});

AutoForm._globalHooks.onSuccess.push(function (type) {
  if (type === 'insert') {
    try {
      if (this.template) {
        this.template.$('[data-reset-file]').click();
      }
    } catch (e) {
      // we're good here
    }
  }
});
