@echo off
for %%i in (*.py) do (
    echo Running %%i
    python "%%i"
    echo.
)