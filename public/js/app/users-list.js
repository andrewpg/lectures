define([
    'backbone'
    , 'app/users-collection'
    , 'text!app/users-list.tpl'
    , 'app/user-form'
], function(Backbone, UsersCollection, tpl, UserForm){
    return Backbone.View.extend({
        el: '.users-list',

        template: _.template(tpl),

        users: new UsersCollection,

        events: {
            'click .user-form': 'showUserForm',
            'click .delete-user': 'deleteUser',
            'click .click-me': 'clickme',
            'click .login': 'login',
            'click .logout': 'logout'
        },

        initialize: function() {
            this.listenTo(this.users, 'sync', this.render);
            this.users.fetch();
            this._userForm = new UserForm();
            this.listenTo(this.users, 'destroy', function() {
                this.users.fetch();
            });

            this.listenTo(Backbone.Events, 'userWasSaved', function() {
                this.users.fetch();
            });
        },

        render: function() {
            this.$el.html(this.template({collection: this.users.toJSON()}));

            this._userForm.setElement(this.$('.' + this._userForm.className).get(0));

            return this;
        },

        showUserForm: function(e) {
            this._userForm.showPopup($(e.target).data('id'));
        },

        deleteUser: function(e) {
            this.users.get($(e.target).data('id')).destroy();
        },
        clickme: function(e) {
            e.preventDefault();
            $.ajax({
                url: "/api/whoami",
                method: "GET",
                cache: false
            }).done(function(x) {
                    alert(x);
                }
            )
        },
        login: function(e) {
            e.preventDefault();
            var name = prompt("enter your name:");
            $.ajax({
                url: "/api/login",
                method: "GET",
                data: {"name": name},
                cache: false
            }).done(function(x) {
                    //alert(x);
                    $('#uname').text(x);
                }
            )
        },
        logout: function(e) {
            e.preventDefault();
            $.ajax({
                url: "/api/logout",
                method: "GET",
                cache: false
            }).done(function(x) {
                    alert(x)
                    if(x.split(' ')[0] === 'session') {
                        window.location.href = "/";
                    } else {
                        $('#uname').text('');
                     //   alert(x);
                    }
                }
            )
        }
    })
});