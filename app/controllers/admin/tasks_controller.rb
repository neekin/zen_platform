# frozen_string_literal: true

module Admin
  class TasksController < AdminController
    before_action :set_task, only: [:show, :update, :destroy]

    # GET /admin/tasks
    def index
      @tasks = policy_scope(Task).ordered
      render inertia: "admin/tasks/Kanban",
        props: { tasks: @tasks.as_json }
    end

    # GET /admin/tasks/:id
    def show
      authorize @task
      render inertia: "admin/tasks/Show",
        props: { task: @task.as_json }
    end

    # POST /admin/tasks
    def create
      @task = Task.new(task_params)
      authorize @task
      if @task.save
        redirect_to admin_task_path(@task), notice: "创建成功"
      else
        redirect_to admin_tasks_path, alert: @task.errors.full_messages.join(", ")
      end
    end

    # PATCH/PUT /admin/tasks/:id
    def update
      authorize @task
      if @task.update(task_params)
        redirect_to admin_task_path(@task), notice: "更新成功"
      else
        redirect_to admin_tasks_path, alert: @task.errors.full_messages.join(", ")
      end
    end

    # DELETE /admin/tasks/:id
    def destroy
      authorize @task
      @task.destroy
      redirect_to admin_tasks_path, notice: "删除成功"
    end

    private

    def set_task
      @task = Task.find(params[:id])
    end

    def task_params
      params.require(:task).permit(:title, :description, :status, :position, :user_id)
    end
  end
end
