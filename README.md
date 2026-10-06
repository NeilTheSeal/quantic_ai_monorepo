# quantic_ai_monorepo

## Installation

Requires **Python 3.14.8** (pinned in `.python-version`).

### Windows

1. Install Python 3.14.8 from [python.org](https://www.python.org/downloads/windows/). The installer includes the `py` launcher.
2. In PowerShell, from the repo root:

   ```powershell
   py -3.14 -m venv .venv
   .venv\Scripts\Activate.ps1
   python --version   # should print Python 3.14.8
   python -m pip install -r requirements.txt
   ```

   If activation fails because script execution is disabled, run this once:

   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```

### Ubuntu

1. Install the build dependencies and [pyenv](https://github.com/pyenv/pyenv):

   ```bash
   sudo apt update
   sudo apt install -y build-essential curl git libssl-dev zlib1g-dev libbz2-dev \
     libreadline-dev libsqlite3-dev libncursesw5-dev xz-utils tk-dev libxml2-dev \
     libxmlsec1-dev libffi-dev liblzma-dev libzstd-dev
   curl -fsSL https://pyenv.run | bash
   ```

2. Add pyenv to `~/.bashrc`, then restart your shell:

   ```bash
   export PYENV_ROOT="$HOME/.pyenv"
   [[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
   eval "$(pyenv init - bash)"
   ```

3. From the repo root:

   ```bash
   pyenv install 3.14.8
   python -m venv .venv
   source .venv/bin/activate
   python --version   # should print Python 3.14.8
   python -m pip install -r requirements.txt
   ```

### macOS

1. Install [Homebrew](https://brew.sh), then pyenv:

   ```bash
   brew install pyenv
   ```

2. Add pyenv to `~/.zshrc`, then restart your shell:

   ```bash
   export PYENV_ROOT="$HOME/.pyenv"
   [[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
   eval "$(pyenv init - zsh)"
   ```

3. From the repo root:

   ```bash
   pyenv install 3.14.8
   python -m venv .venv
   source .venv/bin/activate
   python --version   # should print Python 3.14.8
   python -m pip install -r requirements.txt
   ```

### VS Code

Run **Python: Select Interpreter** and choose `.venv` if it isn't picked automatically.
