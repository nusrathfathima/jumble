package com.jumble.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Jumble backend.
 *
 * Spring Boot looks for this class's main() method to start the whole
 * application: it reads application.properties, wires up every
 * @Component/@Service/@Repository/@RestController it finds under this
 * package (and sub-packages), starts an embedded web server (Tomcat, by
 * default), and begins listening for HTTP requests.
 *
 * You will not need to touch this file again after today — it stays this
 * small for the life of the project. All real code lives in the packages
 * below it (controller, service, repository, model, and so on, added as
 * each part of the app is built).
 */
@SpringBootApplication
public class JumbleBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(JumbleBackendApplication.class, args);
    }
}
