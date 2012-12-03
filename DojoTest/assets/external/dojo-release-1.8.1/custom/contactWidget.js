define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/text!custom/templates/contactWidget.html", "dojo/request", "custom/Contact", "dojo/_base/array"],
    function (declare, WidgetBase, TemplatedMixin, template, request, Contact, arrayUtil) {
        return declare([WidgetBase, TemplatedMixin], {
            postCreate: function(){
                // Get a DOM node reference for the root of our widget
                var domNode = this.domNode;
 
                // Run any parent postCreate processes - can be done at any point
                this.inherited(arguments);

                this.connect(this.nameNode, "onchange", this._itemChanged);
                this.connect(this.phoneNode, "onchange", this._itemChanged);
                this.connect(this.emailNode, "onchange", this._itemChanged);

                this._createList();
            },

            // Our template - important!
            templateString: template,

            _contacts: [],

            _addContact: function(contact){
                this._contacts.push(contact);
            },

            _listClicked: function(e, listItem){
                this.nameNode.value = listItem.name;
                this.phoneNode.value = listItem.phone;
                this.emailNode.value = listItem.email;
                this._activeItem = listItem;
            },

            _activeItem: {},

            _itemChanged: function(){
                this._activeItem._updateUI(this.nameNode.value, this.phoneNode.value, this.emailNode.value);
            },

            // A class to be applied to the root node in our template
            baseClass: "contactWidget",

            _createList: function () {

                var self = this;

                // Load up our authors
                var def = request("assets/external/dojo-release-1.8.1/contacts.json", {
                    handleAs: "json"
                });

                def.then(function (contacts) {
                    arrayUtil.forEach(contacts, function (item) {
                        // Create our widget and place it
                        var widget = new Contact(item);
                        self._addContact(widget);
                        widget.placeAt(self.listNode);
                        self.connect(widget, "onClick", self._listClicked);
                    });
                });
            }
            
        });
    });