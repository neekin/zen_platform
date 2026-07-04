Rails.application.routes.draw do
  get "home/index"

  # Redirect to localhost from 127.0.0.1 to use same IP address with Vite server
  constraints(host: "127.0.0.1") do
    get "(*path)", to: redirect { |params, req| "#{req.protocol}localhost:#{req.port}/#{params[:path]}" }
  end
  root "home#index"

  get "up" => "rails/health#show", as: :rails_health_check

  # Swagger UI
  mount Rswag::Ui::Engine => "/api-docs"
  mount Rswag::Api::Engine => "/api-docs"

  namespace :admin do
    root "dashboard#index"
    get  "login", to: "sessions#new"
    post "login", to: "sessions#create"
    delete "logout", to: "sessions#destroy"
    resources :articles
    resources :comments
    resources :audit_logs, only: [:index, :show] do
      member do
        post :restore
      end
    end
    resources :users, except: [:show]
    resources :roles, except: [:show, :edit, :update]
    resources :permissions, only: [:index] do
      collection do
        patch :update
        post :reset
      end
    end
    resources :api_keys, only: [:index, :create, :destroy]
    resources :exports, only: [:create, :show]
    resources :notifications, only: [:index] do
      member do
        post :mark_as_read
      end
      collection do
        post :mark_all_as_read
      end
    end
  end

  namespace :api do
    namespace :v1 do
      get "health", to: "health#check"
      post "auth/login", to: "auth#login"
      get "auth/me", to: "auth#me"
      get "meta/:model_name", to: "meta#show"
      resources :users, only: %i[index show]
      resources :api_keys, only: %i[index create destroy]
      resources :payment, only: %i[create]
    end
  end
end
