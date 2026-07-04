# Contributing to Zen Platform

Thank you for your interest in contributing!

## Development Setup

1. Fork and clone the repository
2. Run `bin/setup` to install dependencies and set up the database
3. Run `bin/dev` to start the development server
4. Visit `http://localhost:3000/admin` to see the admin panel

## Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Add tests for new features
4. Run the test suite:
   ```bash
   bundle exec rspec
   npm run check
   ```
5. Submit a pull request

## Code Style

- Ruby: Follow `rubocop-rails-omakase`
- TypeScript: Follow the project tsconfig (strict mode in `tsconfig.app.json`)
- Commit messages: Use conventional commits (feat/fix/docs/refactor)

## Adding a New Model

1. Create the model with `Zen::ModelDsl`:
   ```ruby
   class MyModel < ApplicationRecord
     include Zen::ModelDsl
     field :name, :string, required: true
     # ...
   end
   ```

2. Generate admin CRUD:
   ```bash
   rails generate zen:admin MyModel name:string --modal
   ```

3. Run migrations and test

## Questions?

Open a discussion on GitHub Issues.
