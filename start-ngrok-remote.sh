#!/bin/bash
cd "$(dirname "$0")"
ngrok start --config=./ngrok.yml fleet-tcp
