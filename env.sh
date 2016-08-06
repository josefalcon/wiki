#!/bin/bash
export ES="${ES_PORT_9200_TCP_ADDR}:${ES_PORT_9200_TCP_PORT}"
exec "$@"
