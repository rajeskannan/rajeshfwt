require File.dirname(__FILE__) + '/../test_helper'

class DepartmentsControllerTest < ActionController::TestCase
  def test_should_get_index
    get :index
    assert_response :success
    assert_not_nil assigns(:departments)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end

  def test_should_create_department
    assert_difference('Department.count') do
      post :create, :department => { }
    end

    assert_redirected_to department_path(assigns(:department))
  end

  def test_should_show_department
    get :show, :id => departments(:one).id
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => departments(:one).id
    assert_response :success
  end

  def test_should_update_department
    put :update, :id => departments(:one).id, :department => { }
    assert_redirected_to department_path(assigns(:department))
  end

  def test_should_destroy_department
    assert_difference('Department.count', -1) do
      delete :destroy, :id => departments(:one).id
    end

    assert_redirected_to departments_path
  end
end
