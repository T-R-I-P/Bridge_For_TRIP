#!/bin/sh

# init
cd ../Done
make

# Pinocchio
cd ../Pinocchio/DemoUI;
./DemoUI ../../Bridge_For_TRIP/teddy.obj
cp _Dump/* ../../buildFBX/src/References/
