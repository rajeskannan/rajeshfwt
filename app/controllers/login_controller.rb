class LoginController < ApplicationController
  
#  before_filter :authorize
  def add_user
    @user = User.new(params[:user])
    @form = 'userForm'
    if request.post? and @user.save
      flash[:notice] = "User #{@user.name} created"
      @user = User.new
       redirect_to(:controller => "login", :action => "login" )
    end
  end
  
  def login
  @form = 'userForm'
    session[:user_id] = nil
    if request.post?
      user = User.authenticate(params[:name], params[:password])
      if user
        session[:user_id] = user.id
        redirect_to(:controller => "master", :action => "city_list" )
      else
        flash[:notice] = "Invalid user/password combination"
      end
    end
  end
  
  def logout
  end
  
  def delete_user
  end
  
  def list_users
  end
  def index
  @form = 'userForm'
  redirect_to(:controller => "master")
  end 
end
