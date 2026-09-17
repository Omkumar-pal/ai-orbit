-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "tagline" TEXT,
    "pricingModel" TEXT,
    "pricingAmount" TEXT,
    "billingFrequency" TEXT,
    "hasApi" BOOLEAN NOT NULL DEFAULT false,
    "isOpenSource" BOOLEAN NOT NULL DEFAULT false,
    "compatibility" TEXT,
    "releaseDate" TIMESTAMP(3),
    "visitUrl" TEXT,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT,
    "logoUrl" TEXT,
    "modelType" TEXT,
    "pricingModel" TEXT,
    "websiteUrl" TEXT,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Robot" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,

    CONSTRAINT "Robot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTool" (
    "taskId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TaskTool_pkey" PRIMARY KEY ("taskId", "toolId")
);

-- CreateTable
CREATE TABLE "TaskModel" (
    "taskId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,

    CONSTRAINT "TaskModel_pkey" PRIMARY KEY ("taskId", "modelId")
);

-- CreateTable
CREATE TABLE "TaskRobot" (
    "taskId" TEXT NOT NULL,
    "robotId" TEXT NOT NULL,

    CONSTRAINT "TaskRobot_pkey" PRIMARY KEY ("taskId", "robotId")
);

-- CreateTable
CREATE TABLE "TaskDevice" (
    "taskId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "TaskDevice_pkey" PRIMARY KEY ("taskId", "deviceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tool_slug_key" ON "Tool"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Model_slug_key" ON "Model"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Robot_slug_key" ON "Robot"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Device_slug_key" ON "Device"("slug");

-- CreateIndex
CREATE INDEX "TaskTool_toolId_idx" ON "TaskTool"("toolId");

-- CreateIndex
CREATE INDEX "TaskModel_modelId_idx" ON "TaskModel"("modelId");

-- CreateIndex
CREATE INDEX "TaskRobot_robotId_idx" ON "TaskRobot"("robotId");

-- CreateIndex
CREATE INDEX "TaskDevice_deviceId_idx" ON "TaskDevice"("deviceId");

-- AddForeignKey
ALTER TABLE "TaskTool" ADD CONSTRAINT "TaskTool_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTool" ADD CONSTRAINT "TaskTool_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskModel" ADD CONSTRAINT "TaskModel_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskModel" ADD CONSTRAINT "TaskModel_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskRobot" ADD CONSTRAINT "TaskRobot_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskRobot" ADD CONSTRAINT "TaskRobot_robotId_fkey" FOREIGN KEY ("robotId") REFERENCES "Robot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDevice" ADD CONSTRAINT "TaskDevice_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDevice" ADD CONSTRAINT "TaskDevice_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
