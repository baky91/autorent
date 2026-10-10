package com.baky91.autorent;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class AutorentApplication {

	public static void main(String[] args) {
		// Création du dossier 'data' s'il n'existe pas
		File dataDir = new File("data");
		if (!dataDir.exists()) {
			dataDir.mkdirs();
		}

		SpringApplication.run(AutorentApplication.class, args);
	}

}
