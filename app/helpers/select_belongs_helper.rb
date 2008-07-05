module SelectBelongsHelper

  def hidden_select_belongs_div(object, field, options={})
    base_name=Inflector.underscore(Inflector.demodulize(field))
    div_id=options[:div_id] || 'div_'+base_name
    field_id=options[:field_id] || "#{object}_#{Inflector.foreign_key(field)}"
    field_label=options[:field_label] || "#{object}_#{base_name}"
    model=options[:model] || base_name
    controller=options[:controller] || Inflector.pluralize(field)
    url={ :controller=> controller,:action=> (options[:action] || 'update_select') }
    
    
    s=  <<-"THERE"
    <div id='#{escape_javascript(div_id)}' style="display: none; position: fixed; top:100px;">

  <SCRIPT LANGUAGE="JavaScript">
   function set_values_#{div_id}(id,name){
     $('#{escape_javascript(field_id)}').value = id;
     $('#{escape_javascript(field_label)}').value = name;
     Element.hide('#{div_id}');
     #{options[:after_click] }
  }
  </script>
  <table align='center' class='empty_bordered' width='500'> 
  <tr>
    <th align='center'>#{_("Select")} #{_(model)}</th>
    <td align='right'>
      #{ link_to_function _('close'), "Element.hide('#{div_id}')" }
    </td>
   </tr>
   <tr>
    <td colspan='2'>
     <form id="find_#{div_id}">
     #{hidden_field_tag 'model', model }
     #{hidden_field_tag 'js_funct', "set_values_"+div_id }
     #{hidden_field_tag "_notused_#{div_id}", "" }
     </form>
   <div id="items_#{div_id}">
   </div>  
  </td></tr>
 </table>
 </div>
   #{ observe_form "find_"+div_id,  :frequency => 0.5, :update => "items_"+div_id, :url => url }         
   #{javascript_tag("$('_notused_#{div_id}').value=' ';")}

   THERE
   s
  end
  
  def display_select_belongs(object, field)
    base_name=Inflector.underscore(Inflector.demodulize(field))
    div_id='div_'+base_name
    "$('#{div_id}').style.display='block'; "
  end

end
