# Cautions:
- sendgrid does not provide an API for sandboxing, thus all emails sent are really sent.
- as we are using queues as the interface for the mailer workload scheduling, once
  the mailer connects to the rabbitMQ instance it will start sending emails.

  ENSURE THAT QUEUES ARE EMPTY BEFORE STARTING CLI