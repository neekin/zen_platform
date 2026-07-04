module Admin
  class CommentsController < AdminController
    before_action :set_comment, only: [ :show, :update, :destroy ]

    def index
      @comments = policy_scope(Comment)
      render inertia: "admin/comments/Index",
        props: zen_props(Comment, comments: @comments.as_json)
    end

    def create
      @comment = Comment.new(comment_params)
      authorize @comment
      if @comment.save
        redirect_to admin_comments_path, notice: "评论创建成功"
      else
        redirect_to admin_comments_path, alert: @comment.errors.full_messages.join(", ")
      end
    end

    def update
      authorize @comment
      if @comment.update(comment_params)
        redirect_to admin_comments_path, notice: "评论更新成功"
      else
        redirect_to admin_comments_path, alert: @comment.errors.full_messages.join(", ")
      end
    end

    def destroy
      authorize @comment
      @comment.destroy
      redirect_to admin_comments_path, notice: "评论已删除"
    end

    private

    def set_comment
      @comment = Comment.find(params[:id])
    end

    def comment_params
      params.require(:comment).permit(:author_name, :content, :article_id)
    end
  end
end
