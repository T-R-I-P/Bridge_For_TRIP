<?php
	$file = "count.log";
	$now = intval(file_get_contents($file));
	$now ++;
	file_put_contents($file,$now);

	system("scp ../Done/Pinocchio.fbx hc102u@csie0.cs.ccu.edu.tw:~/WWW/fbx/".$now.".fbx");
