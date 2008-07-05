require File.dirname(__FILE__) + '/../test_helper'

class UomsControllerTest < ActionController::TestCase
  def test_should_get_index
    get :index
    assert_response :success
    assert_not_nil assigns(:uoms)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end

  def test_should_create_uom
    assert_difference('Uom.count') do
      post :create, :uom => { }
    end

    assert_redirected_to uom_path(assigns(:uom))
  end

  def test_should_show_uom
    get :show, :id => uoms(:one).id
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => uoms(:one).id
    assert_response :success
  end

  def test_should_update_uom
    put :update, :id => uoms(:one).id, :uom => { }
    assert_redirected_to uom_path(assigns(:uom))
  end

  def test_should_destroy_uom
    assert_difference('Uom.count', -1) do
      delete :destroy, :id => uoms(:one).id
    end

    assert_redirected_to uoms_path
  end
end
