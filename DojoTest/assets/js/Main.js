require(["dojo/request", "dojo/dom", "dojo/_base/array", "custom/contactWidget", "dojo/domReady!"],
    function (request, dom, arrayUtil, ContactWidget) {

        var contactContainer = dom.byId("contactContainer");

        var widget = new ContactWidget().placeAt(contactContainer);
    });