# GNU Make workflow

Run `make` or `make help` to list the project commands. The default only prints help; it does not install, build, publish or start a server. Use GNU Make; executable variables accept a single executable path, including spaces (put flags in the documented argument variables).

Node/npm and package-lock.json define the JavaScript toolchain. package creates the existing release ZIP after type checking/build. Docker operations are separate explicit targets. clean preserves source and settings.

On Windows, Bash-based Makefiles default to Git for Windows under ProgramFiles; override `BASH="C:/path/to/bash.exe"` for another installation. Other projects keep their native command dispatcher. Use `make -n TARGET` to inspect recipes before optional setup, server, package or release operations; a dry run is not evidence that those operations passed.

Generated-output cleanup validates containment and refuses tracked source or symlink/junction targets where its helper is used. No clean target is intended to remove dependency installations, merchant/user files, settings, credentials or production databases. Install explicit development dependencies before running validation. Security audit commands preserve scanner failures and may need network access.
