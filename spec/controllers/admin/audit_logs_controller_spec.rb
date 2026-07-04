# frozen_string_literal: true

RSpec.describe Admin::AuditLogsController, type: :controller do
  let(:admin_user) { User.create!(email: "admin@test.com", username: "admin", name: "Admin", password: "password") }
  let(:editor_user) { User.create!(email: "editor@test.com", username: "editor", name: "Editor", password: "password") }
  let(:article) { Article.create!(title: "测试文章", body: "内容") }

  before do
    # 给 admin_user 分配 admin 角色
    admin_user.add_role(:admin)
    
    # 模拟登录
    allow(controller).to receive(:current_user).and_return(current_user)
  end

  describe "POST #restore" do
    context "when user is admin" do
      let(:current_user) { admin_user }

      before do
        # 触发一个 update 事件
        article.update!(title: "修改后的标题")
        @version = PaperTrail::Version.last
      end

      it "restores update event successfully" do
        post :restore, params: { id: @version.id }

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json["code"]).to eq(0)
        expect(json["message"]).to eq("已还原到该版本")

        # 验证数据已还原
        article.reload
        expect(article.title).to eq("测试文章")
      end

      it "returns error for non-existent version" do
        post :restore, params: { id: 99999 }

        expect(response).to have_http_status(:not_found)
        json = JSON.parse(response.body)
        expect(json["code"]).to eq(1)
      end

      it "handles destroy event by recreating record" do
        # 先删除记录（触发 destroy 事件）
        article_id = article.id
        article.destroy!
        version = PaperTrail::Version.last

        post :restore, params: { id: version.id }

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json["code"]).to eq(0)
        expect(json["message"]).to eq("已重新创建该记录")

        # 验证记录已重新创建
        expect(Article.find_by(id: article_id)).not_to be_nil
      end

      it "handles create event by deleting record" do
        # 创建一个新记录（触发 create 事件）
        new_article = Article.create!(title: "新文章", body: "内容")
        version = PaperTrail::Version.last

        post :restore, params: { id: version.id }

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json["code"]).to eq(0)
        expect(json["message"]).to eq("已删除该记录（还原创建操作）")

        # 验证记录已删除
        expect(Article.find_by(id: new_article.id)).to be_nil
      end
    end

    context "when user is not admin" do
      let(:current_user) { editor_user }

      it "cannot restore" do
        article.update!(title: "测试")
        version = PaperTrail::Version.last

        post :restore, params: { id: version.id }

        expect(response).to have_http_status(:forbidden)
        json = JSON.parse(response.body)
        expect(json["code"]).to eq(1)
        expect(json["message"]).to eq("没有权限执行还原操作")
      end
    end
  end
end
