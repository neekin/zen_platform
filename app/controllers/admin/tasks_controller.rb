# frozen_string_literal: true

# Task 管理控制器
# 用于 Admin 后台的 CRUD 操作
# 对应的 React 页面位于: app/frontend/pages/admin/tasks/
#
# 注意：AdminController 已配置自动从顶层命名空间查找模型
# 所以直接使用 Task 而不需要 ::Task
module Admin
  class TasksController < AdminController
    before_action :require_login
    before_action :set_task, only: [:show, :update, :destroy]

    # GET /admin/tasks
    def index
      @tasks = Task.all


      render inertia: "admin/tasks/Kanban",
        props: {
          tasks: @tasks.as_json(
            include: {

            }
          ),

        }
    end

    # GET /admin/tasks/:id
    def show
      render inertia: "admin/tasks/Show",
        props: {
          task: @task.as_json(
            include: {


            }
          )
        }
    end

    # POST /admin/tasks
    def create
      @task = Task.new(task_params)
      if @task.save
        redirect_to admin_tasks_path(@task), notice: "创建成功"
      else
        redirect_to admin_tasks_path, alert: @task.errors.full_messages.join(", ")
      end
    end

    # PATCH/PUT /admin/tasks/:id
    def update
      if @task.update(task_params)
        redirect_to admin_tasks_path(@task), notice: "更新成功"
      else
        redirect_to admin_tasks_path, alert: @task.errors.full_messages.join(", ")
      end
    end

    # DELETE /admin/tasks/:id
    def destroy
      @task.destroy
      redirect_to admin_tasks_path, notice: "删除成功"
    end

    private

    def set_task
      @task = Task.find(params[:id])
    end

    def task_params
      params.require(:task).permit(:title, :status)
    end
  end
end
