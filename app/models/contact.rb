class Contact < ActiveRecord::Base

has_many :mail_outwards
has_many :quatation
end
