sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/InputBase",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, MessageBox, MessageToast, InputBase, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("sap.ui.marketplace.form.controller.Registration", {
		formCreateContext: undefined,
		isEditMode: false, // Flag to determine if the form is in edit mode

		onInit: function () {
			this.oDataModel = this.getOwnerComponent().getModel();

			this.prepareForm();
		},

		prepareForm: function () {
			if (!this.formCreateContext) {
				console.log("I am prepareForm")
				var oListBinding = this.oDataModel.bindList("/Products");

				this.formCreateContext = oListBinding.create({}, true /* bSkipRefresh */);

				this.getView().setBindingContext(this.formCreateContext);
			}
		},

		onEditProduct: function (oEvent) {
			var oItem = oEvent.getSource().getParent();
			var oContext = oItem.getBindingContext();
			this.isEditMode = true;
			this.getView().setBindingContext(oContext);
		},

		deleteProduct: function (oEvent) {
			// Do Nothing
		},

		onSubmit: async function () {
			try {
				var oContext = this.getView().getBindingContext();
				var oData = oContext.getObject();
				console.log("oData>>>>", oData);

				// if (!oData.Name || !oData.Description || !oData.Owner) {
				// 	MessageBox.error("Please fill all mandatory fields.");
				// 	return;
				// }

				await oContext.getModel().submitBatch(oContext.getModel().getUpdateGroupId());
				MessageToast.show("Product saved successfully");
				this.formCreateContext = null;
				this.prepareForm();


				var oTable = this.byId("productsTable");
				oTable.getBinding("items").refresh();
			} catch (oError) {
				MessageBox.error("Error saving product: " + oError.message);
			}
		}

	});
});
