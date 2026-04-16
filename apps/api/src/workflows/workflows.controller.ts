import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateApprovalDto } from './dto/create-approval.dto';

@ApiTags('workflows')
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a workflow' })
  create(@Body() dto: CreateWorkflowDto) {
    return this.workflowsService.createWorkflow(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List workflows' })
  @ApiQuery({ name: 'projectId', required: false })
  findAll(@Query('projectId') projectId?: string) {
    return this.workflowsService.listWorkflows(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow details' })
  findOne(@Param('id') id: string) {
    return this.workflowsService.getWorkflow(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update workflow status' })
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.workflowsService.updateWorkflowStatus(id, body.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workflow' })
  remove(@Param('id') id: string) {
    return this.workflowsService.deleteWorkflow(id);
  }

  @Post('tasks')
  @ApiOperation({ summary: 'Create a task' })
  createTask(@Body() dto: CreateTaskDto) {
    return this.workflowsService.createTask(dto);
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get task details' })
  getTask(@Param('id') id: string) {
    return this.workflowsService.getTask(id);
  }

  @Patch('tasks/:id/status')
  @ApiOperation({ summary: 'Update task status' })
  updateTaskStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.workflowsService.updateTaskStatus(id, body.status);
  }

  @Post('approvals')
  @ApiOperation({ summary: 'Create an approval request' })
  createApproval(@Body() dto: CreateApprovalDto) {
    return this.workflowsService.createApproval(dto);
  }

  @Post('reviews')
  @ApiOperation({ summary: 'Submit a review' })
  submitReview(@Body() body: { workflowId: string; reviewerId: string; comments: string; status: string }) {
    return this.workflowsService.submitReview(body.workflowId, body.reviewerId, body.comments, body.status);
  }

  @Get('notifications/:userId')
  @ApiOperation({ summary: 'Get notifications for a user' })
  getNotifications(@Param('userId') userId: string) {
    return this.workflowsService.listNotifications(userId);
  }

  @Get('activity/logs')
  @ApiOperation({ summary: 'Retrieve activity logs' })
  getActivityLogs() {
    return this.workflowsService.listActivityLogs();
  }
}
