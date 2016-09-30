# Cautions:
- sendgrid does not provide an API for sandboxing, thus all emails sent are really sent.
- as we are using queues as the interface for the mailer workload scheduling, once
  the mailer connects to the rabbitMQ instance it will start sending emails.

  ENSURE THAT QUEUES ARE EMPTY BEFORE STARTING CLI'


# docker run rabbitmq
`docker run -d --hostname my-rabbit --name my-rabbit -p 4369:4369 -p 5671:5671 -p 5672:5672 -p 15672:15672 -p 25672:25672 rabbitmq:3-management`