# frozen_string_literal: true

RSpec.describe Admin::AuditLogsController, type: :controller do
  let(:admin_user) { User.create!(email: "admin_audit_logs_controller_spec@test.com", username: "admin_audit_logs_controller_spec", name: "Admin", password: "password") }
  let(:editor_user) { User.create!(email: "editor_audit_logs_controller_spec@test.com", username: "editor_audit_logs_controller_spec", name: "Editor", password: "password") }
  let(:test_user) { User.create!(email: "target@test.com", username: "target", name: "测试用户", password: "password") }

  before do
    admin_user.add_role(:admin)
    allow(controller).to receive(:current_user).and_return(current_user)
  end

  describe "POST #restore" do
    context "when user is admin" do
      let(:current_user) { admin_user }

      before do
        test_user.update!(name: "修改后的名字")
        @version = PaperTrail::Version.last
      end

      it "restores update event successfully" do
        post :restore, params: { id: @version.id }

        expect(response).to redirect_to(admin_audit_logs_path)
        expect(flash[:notice]).to eq("已还原到该版本")

        test_user.reload
        expect(test_user.name).to eq("测试用户")
      end

      it "returns error for non-existent version" do
        post :restore, params: { id: 99999 }

        expect(response).to redirect_to(admin_audit_logs_path)
        expect(flash[:alert]).to eq("版本记录不存在")
      end

      it "handles destroy event by recreating record" do
        user_id = test_user.id
        test_user.destroy!
        version = PaperTrail::Version.last

        post :restore, params: { id: version.id }

        expect(response).to redirect_to(admin_audit_logs_path)
        expect(flash[:notice]).to eq("已重新创建该记录")

        expect(User.find_by(id: user_id)).not_to be_nil
      end

      it "handles create event by deleting record" do
        new_user = User.create!(email: "new@test.com", username: "new_user", name: "新用户", password: "password")
        version = PaperTrail::Version.last

        post :restore, params: { id: version.id }

        expect(response).to redirect_to(admin_audit_logs_path)
        expect(flash[:notice]).to eq("已删除该记录（还原创建操作）")

        expect(User.find_by(id: new_user.id)).to be_nil
      end
    end

    context "when user is not admin" do
      let(:current_user) { editor_user }

      it "cannot restore" do
        test_user.update!(name: "测试")
        version = PaperTrail::Version.last

        post :restore, params: { id: version.id }

        expect(response).to redirect_to(admin_root_path)
        expect(flash[:alert]).to eq("没有权限执行还原操作")
      end
    end
  end
end
