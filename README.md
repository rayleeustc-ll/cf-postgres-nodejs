Readme

1. ensure the postgres services is installed on your cloud foundry environment.few cf command line can be use to check the db services.
    cf marketplace
    cf create-service {service_name} {service_plan} {instance_name}
    cf services
    cf delete-service {instance_name}

2. Clone this repository and run the cf push in the project root directory.
    cf push

3. Check the application routes using the cf command line.
    cf app applicationName

4. Using curl to test the server response, curl route name.
    curl https://domain:port