Rails.application.routes.draw do
  get "home/index"

  # Redirect to localhost from 127.0.0.1 to use same IP address with Vite server
  constraints(host: "127.0.0.1") do
    get "(*path)", to: redirect { |params, req| "#{req.protocol}localhost:#{req.port}/#{params[:path]}" }
  end
  root "home#index"

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :admin do
    root "dashboard#index"
    get  "login", to: "sessions#new"
    post "login", to: "sessions#create"
    delete "logout", to: "sessions#destroy"
  end
end
