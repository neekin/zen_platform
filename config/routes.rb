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
    resources :articles, only: [:index, :show, :create, :update, :destroy]
    resources :articles, only: [:index, :show, :new, :create, :edit, :update, :destroy]
  end

  namespace :api do
    namespace :v1 do
      get "health", to: "health#check"
      post "auth/login", to: "auth#login"
      get "auth/me", to: "auth#me"
      resources :users, only: %i[index show]
      resources :payment, only: %i[create]
    end
  end
end
