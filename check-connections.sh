#!/bin/bash
grep "Client connected" ~/.pm2/logs/teltonika-server-out.log | tail -n 5
