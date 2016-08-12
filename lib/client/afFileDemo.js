Template.afFileDemo.onCreated(function(){


})

Template.afFileDemo.helpers({
	getFile() {
		let fileId = AutoForm.getFieldValue(Template.instance().data.name);//need to get formid
		return Images.findOne({_id: fileId})/*global[Template.instance().collectionName()].findOne({
      _id: Template.instance().fileId.get()
    });*/
	}
})

Template.afFileDemo.events({

})