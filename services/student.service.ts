import { httpClient } from '@/utils/http-client';
import type {
    Student,
    StudentSummary,
    StudentDetail,
    StudentMonthStatus,
    CreateStudentRequest,
    UpdateStudentRequest,
} from '@/types/student';

export const studentService = {
    list: async (): Promise<StudentSummary[]> => {
        const response = await httpClient.get<StudentSummary[]>('/students');
        return response.data ?? [];
    },

    getDetail: async (id: string): Promise<StudentDetail> => {
        const response = await httpClient.get<StudentDetail>(`/students/${id}`);
        return response.data!;
    },

    getTimeline: async (id: string): Promise<StudentMonthStatus[]> => {
        const response = await httpClient.get<StudentMonthStatus[]>(`/students/${id}/timeline`);
        return response.data ?? [];
    },

    create: async (data: CreateStudentRequest): Promise<Student> => {
        const response = await httpClient.post<Student>('/students', data);
        return response.data!;
    },

    update: async (id: string, data: UpdateStudentRequest): Promise<Student> => {
        const response = await httpClient.patch<Student>(`/students/${id}`, data);
        return response.data!;
    },

    remove: async (id: string): Promise<Student> => {
        const response = await httpClient.delete<Student>(`/students/${id}`);
        return response.data!;
    },
};
