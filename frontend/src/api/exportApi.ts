import instance from './axiosInstance';

export const exportExcel = (params: { start: string; end: string }) => {
  return instance.get('/admin/export/excel', { params, responseType: 'blob' })
    .then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
};

export const exportPDF = (params: { start: string; end: string }) => {
  return instance.get('/admin/export/pdf', { params, responseType: 'blob' })
    .then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
};