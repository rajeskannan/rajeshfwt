class MasterController < ApplicationController
before_filter :authorize
#require 'prince'
 include PdfHelper
#layout 'master'
  #### City ####
  def city_list
    @cities = City.find(:all)
    @form = 'cityMain'
    @grid = true

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @cities }
    end
  end

  def city_new
    @city = City.new
    @form = 'cityForm'
    @calender=true
    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @city }
    end
  end

  def city_edit
  @form = 'cityForm'
    @city = City.find(params[:id])
  end

  def city_create
    @city = City.new(params[:city])
    @form = 'cityForm'
    respond_to do |format|
      if @city.save
        flash[:notice] = 'City was successfully created.'
        #format.html { redirect_to(@city) }
        format.html { redirect_to("/master/city_list") }
        format.xml  { render :xml => @city, :status => :created, :location => @city }
      else
        format.html { render :action => "city_new" }
        format.xml  { render :xml => @city.errors, :status => :unprocessable_entity }
      end
    end
  end


def city_update
    @city = City.find(params[:id])
    @form = 'cityForm'
    respond_to do |format|
      if @city.update_attributes(params[:city])
        flash[:notice] = 'City was successfully updated.'
       # format.html { redirect_to(@city) }
       format.html { redirect_to("/master/city_list") }
        format.xml  { head :ok }
      else
        format.html { render :action => "city_edit" }
        format.xml  { render :xml => @city.errors, :status => :unprocessable_entity }
      end
    end
  end

  def city_delete
    @city = City.find(params[:id])
    @city.destroy
    @form = 'cityForm'
    respond_to do |format|
      format.html { redirect_to("/master/city_list") }
      format.xml  { head :ok }
    end
  end
#######################

#######################################
#departmentcontroller start

 # GET /departments
  # GET /departments.xml
  def department_list
    @departments = Department.find(:all)
    @form = 'depatmentMain'
     @grid = true
    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @departments }
    end
  end

  # GET /departments/new
  # GET /departments/new.xml
  def department_new
    @department = Department.new
    @form = 'departmentForm'
    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @department }
    end
  end

  # GET /departments/1/edit
  def department_edit
    @department = Department.find(params[:id])
        @form = 'departmentForm'
  end

  # POST /departments
  # POST /departments.xml
  def department_create
    @department = Department.new(params[:department])
    @form = 'departmentForm'
    respond_to do |format|
      if @department.save
        flash[:notice] = 'Department was successfully created.'
        format.html { redirect_to("/master/department_list") }
        format.xml  { render :xml => @department, :status => :created, :location => @department }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @department.errors, :status => :unprocessable_entity }
      end
    end
  end


 def department_update
    @department = Department.find(params[:id])
    @form = 'departmentForm'
    respond_to do |format|
      if @department.update_attributes(params[:department])
        flash[:notice] = 'Department was successfully updated.'
        #format.html { redirect_to(@department) }
        format.html { redirect_to("/master/department_list") }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @department.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /departments/1
  # DELETE /departments/1.xml
  def department_delete
    @department = Department.find(params[:id])
    @form = 'departmentForm'
    @department.destroy

    respond_to do |format|
      format.html { redirect_to('/master/department_list') }
      format.xml  { head :ok }
    end
  end
##departmentcontroller end

#############################
#rolescontroller start
 
  def role_list
    @roles = Role.find(:all)
    @form = 'roleMain'
    @grid = true
    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @roles }
    end
  end
  
  # GET /roles/new
  # GET /roles/new.xml
  def role_new
    @role = Role.new
    @form = 'roleForm'
    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @role }
    end
  end

  # GET /roles/1/edit
  def role_edit
    @role = Role.find(params[:id])
   @form = 'roleForm'
  end

  # POST /roles
  # POST /roles.xml
  def role_create
    @role = Role.new(params[:role])
    @form = 'roleForm'
    respond_to do |format|
      if @role.save
        flash[:notice] = 'Role was successfully created.'
        format.html { redirect_to("/master/role_list")}
        format.xml  { render :xml => @role, :status => :created, :location => @role }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @role.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /roles/1
  # PUT /roles/1.xml
  def role_update
    @role = Role.find(params[:id])
    @form = 'roleForm'
    respond_to do |format|
      if @role.update_attributes(params[:role])
        flash[:notice] = 'Role was successfully updated.'
        format.html { redirect_to("/master/role_list") }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @role.errors, :status => :unprocessable_entity }
      end
    end
  end


  # DELETE /roles/1
  # DELETE /roles/1.xml
  def role_delete
    @role = Role.find(params[:id])
    @role.destroy
    @form = 'roleForm'
    respond_to do |format|
      format.html { redirect_to("/master/role_list") }
      format.xml  { head :ok }
    end
  end


##rolescontroller end
##########################################
#uomcontroller start
# GET /uoms
  # GET /uoms.xml
 
  def uom_list
    @uoms = Uom.find(:all)
    @form = 'uomMain'
    @grid = true
    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @uoms }
    end
  end
  

  # GET /uoms/new
  # GET /uoms/new.xml
  def uom_new
    @uom = Uom.new
    @form = 'uomForm'
    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @uom }
    end
  end

  # GET /uoms/1/edit
  def uom_edit
    @uom = Uom.find(params[:id])
    @form = 'uomForm'
  end

  # POST /uoms
  # POST /uoms.xml
  def uom_create
    @uom = Uom.new(params[:uom])
    @form = 'uomForm'
    respond_to do |format|
      if @uom.save
        flash[:notice] = 'Uom was successfully created.'
        format.html { redirect_to("/master/uom_list")}
        format.xml  { render :xml => @uom, :status => :created, :location => @uom }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @uom.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /uoms/1
  # PUT /uoms/1.xml

def uom_update
    @uom = Uom.find(params[:id])
    @form = 'uomForm'
    respond_to do |format|
      if @uom.update_attributes(params[:uom])
        flash[:notice] = 'Uom was successfully updated.'
        #format.html { redirect_to(@uom) }
        format.html { redirect_to("/master/uom_list") }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @uom.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /uoms/1
  # DELETE /uoms/1.xml
  def uom_delete
    @uom = Uom.find(params[:id])
    @form = 'uomForm'    
    @uom.destroy

    respond_to do |format|
      format.html { redirect_to("master/uom_list") }
      format.xml  { head :ok }
    end
  end

def contact_update
    @contact = Contact.find(params[:id])
    @form = 'contactForm'
    respond_to do |format|
      if @contact.update_attributes(params[:contact])
        flash[:notice] = 'Uom was successfully updated.'
        #format.html { redirect_to(@uom) }
        format.html { redirect_to("/master/contact_list") }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @uom.errors, :status => :unprocessable_entity }
      end
    end
  end



    def contact_new
    @contact = Contact.new
    @form='contactForm'
    
    respond_to do |format|
      format.html
      format.xml  { render :xml => @contact }
    end
  end
  
  
  def contact_create
  
    @contact = Contact.new(params[:contact])
  @form='contactForm'  
    respond_to do |format|
      if @contact.save
        flash[:notice] = 'Contact was successfully created.'
#        render(:text => "Contact was successfully created.")
        format.html { redirect_to("/master/contact_list") }
#        format.html { redirect_to(@contact) }
        format.xml  { render :xml => @contact, :status => :created, :location => @contact }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @contact.errors, :status => :unprocessable_entity }
      end
    end
  end
  

  def contact_list
    @contacts = Contact.find(:all)
    @form = 'contactMain'
    @grid = true

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @contacts }
    end
  end
  
  def contact_edit
    @form = 'contactForm'
    @contact = Contact.find(params[:id])
  end


  def contact_delete
    @contact = Contact.find(params[:id])
    @form = 'contactForm'    
    @contact.destroy

    respond_to do |format|
      format.html { redirect_to("master/contact_list") }
      format.xml  { head :ok }
    end
  end
  
def pdf_gen
   prince = Prince.new()
   html_string = render_to_string(:template => '/master/city_new')
   send_data(
     prince.pdf_from_string(html_string),
     :filename => 'some_document.pdf',
     :type => 'application/pdf'
   )


end  
  end
