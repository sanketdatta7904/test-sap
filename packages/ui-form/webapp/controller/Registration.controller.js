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

		onInit: function () {
			// keep the reference to the OData model
			this.oDataModel = this.getOwnerComponent().getModel();

			// load previous data
			this.prepareForm();
		},

		prepareForm: function () {
			// if binding context is not created
			if (!this.formCreateContext) {
				// Get list of data products using ODATA model
				var oListBinding = this.oDataModel.bindList("/Products");

				// Create new binding context
				this.formCreateContext = oListBinding.create({}, true /* bSkipRefresh */);

				// Attach binding context to the form
				this.getView().setBindingContext(this.formCreateContext);
			}
		},

		onEditProduct: function (oEvent) {
			var oItem = oEvent.getSource().getParent();
			var oContext = oItem.getBindingContext();
			this.getView().setBindingContext(oContext);
		},

		deleteProduct: function (oEvent) {
			// Do Nothing
		},

		onSubmit: function () {
			var oContext = this.getView().getBindingContext();
			var oData = oContext.getObject();
			console.log("oData>>>>", oData);

			if (!oData.Name || !oData.Description || !oData.Owner) {
				MessageBox.error("Please fill all mandatory fields.");
				return;
			}

			oContext.getModel().submitBatch(oContext.getModel().getUpdateGroupId())
				.then((res) => {
					console.log("Response from submitBatch:", res);
					MessageToast.show("Product saved successfully");
					this.formCreateContext = null;
					this.prepareForm();

					var oTable = this.byId("productsTable");
					oTable.getBinding("items").refresh();
				})
				.catch((oError) => {
					console.log("Error caught:", oError);
					let sErrorMessage = "Unknown error occurred.";

					if (oError.responseText) {
						try {
							const oErrorResponse = JSON.parse(oError.responseText);
							sErrorMessage = oErrorResponse.error.message.value || sErrorMessage;
						} catch (e) {
							sErrorMessage = oError.message || sErrorMessage;
						}
					} else {
						sErrorMessage = oError.message || sErrorMessage;
					}
					MessageBox.error("Error saving product: " + sErrorMessage);
				});
		}
	});
});
