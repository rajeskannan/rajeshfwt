# Author: Michael Schuerig, michael@schuerig.de, 2005
#
# Free for all uses. No warranty or anything. Comments welcome.
#
# == What is it?
#
# The Association Helper methods create widgets for choosing
# associated objects. Available choices are retrieved "AJAX-style" 
# behind the scenes.
#
# Currently, only +belongs_to+ references are supported.
# Keep in mind, though, that +has_one+ references are just the other end
# of +belongs_to+ references.
#
# == Installation
#
#  public/
#      javascripts/
#          association-helper.js
#          prototype.js  -  included in Rails distribution
#
# Then, in the head section of your page templates, possibly in a layout,
# include the necessary files like this:
#
#  <%= javascript_include_tag 'prototype', 'association-helper' %>
#
# == Usage
#
# === In Views
#
# See the documentation of the individual methods.
#
# === In Controllers
#
# In controllers of views that use the helper methods, you have to make
# these methods known like this.
#
#  class SomethingController < ApplicationController
#    helper :association
#
# In the controllers queried for candidate associate objects, you need
# to provide an action method that handles the respective requests.
# You can implement them manually, of course.
# For a large number of cases this will not be necessary, hopefully,
# when you use RailsExtensions::AjaxSupport.define_search_action.
#
#
# == TODO
#
# * All the other kinds of associations
# * Unit tests...
#
module AssociationHelper

  # Creates a popup for choosing a "belongs_to"-associated object
  # displayed in a preexisting field.
  # The popup is triggered by clicking or focussing the display field.
  #
  # Options are:
  #
  # * +:controller+ - controller to be used for AJAX requests; default: downcased name of the associated class.
  # * +:action+ - action to be used for AJAX requests; default: 'ajax'. (FIXME: really?)
  # * +:query_param+ - request parameter name for the query string; default: 'query'.
  # * +:popup_class+ - class attribute for the main popup +div+; default: 'popup'.
  # * +:optional+ - is the associated object optional (allowed to be +null+)? default: false.
  #
  def belongs_to_popup(object_name, association_name, options = {})
    controller = options[:controller] || controller_for_search(object_name, association_name)
    action = options[:action] || 'ajax'
    query_param = options[:query_param] || 'query'
    popup_div_class = options[:popup_class] || 'popup'
    optional = options[:optional] || false

    fk_attribute = fk_attribute_for(object_name, association_name)
    target_field_id = object_name + '_' + association_name
    popup_id = target_field_id + '_popup'
    query_field_id = popup_id + '_query'
    result_list_id = popup_id + '_list'

    fkField = hidden_field(object_name, fk_attribute)
    observer = observe_field(query_field_id,
                :frequency => 0.5,
                :update => result_list_id,
                :url => { :controller => controller, :action => action },
                :with => "'#{query_param}=' + escape(value)")

<<END
#{fkField}
<div id="#{popup_id}" class="#{popup_div_class}" style="display:none;position:absolute;">
  <input type="text" id="#{query_field_id}" size="#{options[:size]}"></input>
  <div id="#{result_list_id}"></div>
</div>
<script type="text/javascript">
  new BelongsToPopup("#{target_field_id}", #{optional});
</script>
#{observer}
END
  end

  # Creates a text field with associated popup for choosing a
  # "belongs_to"-associated object.
  # The popup is triggered by clicking or focussing the display field.
  #
  # A block, when given, is used to set the initial contents of
  # the text field. The block receives the initially selected object,
  # which may be +nil+.
  #
  # Example:
  #
  # <%= belongs_to_field('project', 'manager') { |it| it.name if it } %>
  #
  # This snippet creates a read-only text field. When that field
  # gains the focus or is clicked, a query input field pops up
  # on top of it. As soon as the user starts to type, matching
  # objects are retrieved from the server and displayed in a
  # list below the query field.
  #
  # Options are:
  #
  # * +:controller+ - controller to be used for AJAX requests; default: downcased name of the associated class.
  # * +:action+ - action to be used for AJAX requests; default: 'ajax'. (FIXME: really?)
  # * +:query_param+ - request parameter name for the query string; default: 'query'.
  # * +:popup_class+ - class attribute for the main popup +div+; default: 'popup'.
  # * +:optional+ - is the associated object optional (allowed to be +null+)? default: false.
  # * +:size* - size of the created field; default: none.
  #
  def belongs_to_field(object_name, association_name, options = {})
    raw_value = value_for(object_name, association_name)
    value = block_given? ? yield(raw_value) : raw_value.to_s

    field = text_field(object_name, association_name,
      :size => options[:size], :readonly => true,
      :name => '', :value => value)

    field + belongs_to_popup(object_name, association_name, options)
  end

  private

  def object_for(object_name)
    self.instance_variable_get("@#{object_name}")
  end

  def class_for(object_name)
    if object = object_for(object_name)
      object.class
    end
  end

  def value_for(object_name, method_name)
    if object = object_for(object_name)
      object.send(method_name)
    end
  end

  def options_for_association(object_name, association_name, &block)
    if klass = class_for(object_name)
      if meta = klass.reflect_on_association(association_name.to_sym)
        options = meta.options
        if block_given?
          yield options
        else
          options
        end
      end
    end
  end

  # Heuristically uses the downcased name of the associated class
  # as the controller name.
  def controller_for_search(object_name, association_name)
    options_for_association(object_name, association_name) do |options|
      Inflector.demodulize(options[:class_name] || association_name).downcase
    end
  end

  def fk_attribute_for(object_name, association_name)
    options_for_association(object_name, association_name) do |options|
      options[:foreign_key] || association_name + '_id'
    end
  end

  def association_for(object_name, association_name)
    if object = object_for(object_name)
      object.send(association_name)
    end
  end

end
