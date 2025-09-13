# cceh-alert
Alerting system for the Comptoir Commercial Enchères et en Hausse (cceh.trade)

# Getting Started

Clone this repository
```
git clone https://github.com/joelplourde4/cceh-alert.git
```

Install the packages
```
npm install
```

Run the Application
```
npm run-script start
```

## Docker
Build Docker Image
```
docker build --tag cceh-alert:1.0.0 .
```

Start the Docker container
```
docker run -e WEBHOOK_URL="https://discord.com/api/webhooks/..." cceh-alert:1.0.0
```