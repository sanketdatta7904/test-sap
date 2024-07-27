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

			// // load previous data
			this.prepareForm();

		},

		prepareForm: function() {
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


		deleteProduct: function(oEvent) {
			// Do nothing
		},
		
		onSubmit: async function() {
			var oContext = this.getView().getBindingContext(); // Reference to the binding context used in the form

			//TODO: send data to backend using odata model (Hint: refer SAPUI5 odata model V4 documentation, also check groupID in manifest.json for Odata model)
			//TODO: cleanup form
			//TODO: update table data to show new product
		},

	});

});
