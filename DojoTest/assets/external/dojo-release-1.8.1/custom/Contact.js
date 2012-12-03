define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin"],
    function (declare, WidgetBase, TemplatedMixin) {
        return declare([WidgetBase, TemplatedMixin], {
            postCreate: function () {
                // Get a DOM node reference for the root of our widget
                var domNode = this.domNode;

                this.watch("name", function (attr, oldVal, newVal) {
                    alert(oldVal + " => " + newVal);
                });
            },

            templateString: '<li data-dojo-attach-event="onclick: _onClick">${name}, ${phone}, ${email}</li>',

            _onClick: function(e){
                this.onClick(e, this);
            },
            onClick: function(e, listItem){
            },
            name: "",
            phone: "",
            email: "",

            _valueChanged: function () {
                this.domNode.innerHTML = this.name + ', ' + this.phone + ', ' + this.email;
            },

            _updateUI: function(name, phone, email){
                this.set("name", name);
                this.phone = phone;
                this.email = email;
                this._valueChanged();
            }

        });
    });