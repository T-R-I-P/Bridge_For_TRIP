#!/bin/sh

# overall
mv ../buildFBX/bin/Pinocchio.fbx ../Done
mv ../Pinocchio/DemoUI/_Dump/* ../Done/_Dump
mv ./teddy.obj ../Done
rm -f ../buildFBX/src/References/*

# init
now=$(date +"%T")
cd ../Log;
mkdir $now;
cp -rf ../Done/* ./$now
