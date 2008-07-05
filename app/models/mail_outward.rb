class MailOutward < ActiveRecord::Base

belongs_to  :contact

has_many :contract_review



end
