sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.marketplace.form.controller.Registration", {
		formCreateContext: undefined,
		onInit: function () {
			this.oDataModel = this.getOwnerComponent().getModel();
			this.localModel = new JSONModel({
				Name: "",
				Description: "",
				Owner: ""
			});
			this.getView().setModel(this.localModel, "local");
			this.isEditMode = false;
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
			var oContext = oEvent.getSource().getParent().getBindingContext();
			this.localModel.setData(oContext.getObject());
			this.getView().setBindingContext(oContext);
			this.isEditMode = true;
		},

		onNameInputLiveChange: function (oEvent) {
			this.localModel.setProperty("/Name", oEvent.getParameter("value"));
		},

		onDescriptionInputLiveChange: function (oEvent) {
			this.localModel.setProperty("/Description", oEvent.getParameter("value"));
		},

		onOwnerInputLiveChange: function (oEvent) {
			this.localModel.setProperty("/Owner", oEvent.getParameter("value"));
		},

		deleteProduct: function (oEvent) {
			// Do Nothing
		},

		onSubmit: async function () {
			try {
				var oData = this.localModel.getData();

				if (!oData.Name || !oData.Description || !oData.Owner) {
					MessageBox.error("Please fill all mandatory fields.");
					return;
				}

				if (this.isEditMode) {
					var oContext = this.getView().getBindingContext();
					oContext.setProperty("Name", oData.Name);
					oContext.setProperty("Description", oData.Description);
					oContext.setProperty("Owner", oData.Owner);
				} else {
					var oListBinding = this.oDataModel.bindList("/Products", undefined, undefined, undefined, { $count: true });
					oListBinding.create(oData, true, { groupId: "create" });

				}

				await this.oDataModel.submitBatch("update")

				MessageToast.show(this.isEditMode ? "Product updated successfully" : "Product created successfully");
				this.resetForm();


				var oTable = this.byId("productsTable");
				oTable.getBinding("items").refresh();
			} catch (oError) {
				MessageBox.error("Error saving product: " + oError.message);
			}
		},
		resetForm: function () {
			this.getView().setBindingContext(null);
			this.localModel.setData({
				Name: "",
				Description: "",
				Owner: ""
			});
			this.isEditMode = false;
		}
	});
});
