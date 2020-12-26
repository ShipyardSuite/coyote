FROM {{node-version}}

WORKDIR {{work-dir}}

COPY package*.json {{package-copy-target}}

RUN {{run-command}}

COPY . {{copy-target}}

EXPOSE {{exposed-port}}

CMD [ {{start-command}} ]
