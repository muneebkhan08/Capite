# Contributing to Capite

Thank you for your interest in contributing to Capite! This guide will help you get started.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Capite.git`
3. Create a branch: `git checkout -b feature/your-feature`
4. Make your changes
5. Submit a pull request

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- FFmpeg
- Docker (optional)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npx prisma generate
npm run dev
```

### Docker

```bash
docker compose -f docker-compose.dev.yml up
```

## Code Style

### Python
- Follow PEP 8
- Use type hints where practical
- Run `flake8` before committing

### TypeScript
- Follow the existing ESLint configuration
- Use TypeScript strictly (no `any`)
- Run `npm run lint` before committing

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Keep PRs focused — one feature per PR

## Bug Reports

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS/Docker version

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
