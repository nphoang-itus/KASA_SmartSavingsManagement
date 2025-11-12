-- Tables for User, Account
create table role (
  roleid serial primary key, -- 1,2,3, ... for admin, auditor, teller
  rolename varchar(20) not null
);
 


create table employee (
  employeeid int primary key,
  fullname varchar(50) not null,
  roleid int references role(roleid)
);
create sequence emp_suffix_seq start 0 increment 1 minvalue 0 maxvalue 99; -- tối đa tạo 100 nhân viên cho mỗi cấp


-- Trigger để tự sinh primary key cho Employee
  create or replace function generate_employee_id()
  returns trigger as $$
  declare
    max_id int;
  begin
    select coalesce(max(e.employeeid), 10299) into max_id --bắt đầu từ 10300 là nhân viên giao dịch
    from employee e
    where roleid = 3;
    new.employeeid := max_id + 1;
    return new;
  end;
  $$ language plpgsql;


--Gắn trigger vào bảng Employee
create trigger employee_id_trigger
before insert on employee
for each row
when (new.roleid = 3 and new.employeeid is null)
execute function generate_employee_id();


create table useraccount (
  userid int primary key references employee(employeeid), --
  password varchar(100) not null,
  registerstatus varchar(20)
);
  --Constraint update User,Account
  Alter table role
  Add Constraint check_rolename
  Check (rolename in ('Teller', 'Auditor', 'Administrator'));


  Alter TABLE useraccount
  ADD CONSTRAINT check_register_status
  CHECK (registerstatus in ('Unsubmitted', 'Submitted', 'Approved', 'Rejected'));




-- Tables for Saving Book and Customer
create table typesaving (
  typeid serial primary key,
  termperiod int,
  interest numeric(8,3) --Đơn vị: % -> 0.15, 0.5, 0.55 (%) (là lãi suất trong 1 tháng)
);


create table customer (
  customerid serial primary key,
  fullname varchar(70),
  citizenid varchar(18) unique, -- CCCD/CMND
  street varchar(20),
  district varchar(15),
  province varchar(20)
);


create table savingbook (
  bookid serial primary key,
  typeid int,
  customerid int,
  registertime timestamp default now(),
  maturitydate timestamp,
  status varchar(10)
);


-- Truy vấn tới một constraint mà mình chưa đặt tên trong 1 bảng
--SELECT conname, contype, conrelid::regclass AS table_name
--FROM pg_constraint
--WHERE conrelid = 'SavingBook'::regclass;


Alter table savingbook
Add Column closetime timestamp,
Add Column currentbalance numeric(15,2),
Add Constraint check_closetime check (closetime >= maturitydate),
Add Constraint check_currentbalance check (currentbalance >= 0);


  --Câu Query Nếu chỉ muốn hiển thị ngày hoặc giờ riêng, cho timestamp
  --- Select to_char (<attribute>, 'YYYY-MM-DD') as date_only
  --- Select to_char (<attribute>, 'HH24:MI:SS') as time_only
  --- From <Table>


  -- Tạo Sequence để tăng số tự nhiên, tạo khóa chính tối ưu cho bảng Transaction,
  CREATE SEQUENCE trans_seq START 1 INCREMENT 1;


create table transaction (
  --tạo khóa chính của giao dịch kết hợp giữa Date+time + số thứ tự: chỉ dùng cho server một chi nhánh, nếu nhiều chi nhánh khác nhau thì có thể cần thêm 2 chữ số mã chi nhánh ở đầu.
  transactionid varchar(20) primary key
    default to_char( Now(), 'YYYYMMDDHH24MISS') || LPAD(nextval('trans_seq')::text,4 ,'0'),
  bookid int,
  transactiontype varchar(12),
  amount numeric(15,2) check (amount > 0), -- Alert: Nên thêm trigger amount <= CurrentBalance
  transactiondate timestamp default now(),
  note text
);
 --constraint update for Saving book and Customer
  Alter table typesaving
  Add constraint check_termperiod
  Check (termperiod >= 0), -- Alert: Compute the current balance for the No term
  Add constraint check_interest
  Check (interest >= 0);
 
  Alter table savingbook
  Add Constraint fk_typeidsavingbook_typesaving foreign key (typeid) references typesaving(typeid),
  Add Constraint fk_customeridsavingbook_customer foreign key (customerid) references customer(customerid),
  Add Constraint check_registertime Check (registertime >= '2025-01-01'),
  Add Constraint check_maturitydate Check (maturitydate >= registertime),
  Add Constraint check_status Check (status in ('Open', 'Close'));


  Alter table transaction
  Add Constraint fk_bookidtransaction_savingbook foreign key (bookid) references savingbook(bookid),
  Add Constraint check_transactiontype Check (transactiontype in ('Deposit', 'WithDraw'));
 --End Adding constraint




--Adding Mock information


 --Role
  INSERT INTO role (rolename)
  VALUES
    ('Administrator'),
    ('Auditor'),
    ('Teller')
    ;
 --Employee
  INSERT INTO employee (employeeid, fullname, roleid)
  VALUES
    (10100,'Nguyen Van A', 1),
    (null, 'Tran Thi B', 3),
    (10200, 'Le Van C', 2),
    (null, 'Pham Thi D', 3),
    (null, 'Hoang Van E', 3);




 -- UserAccount
  INSERT INTO useraccount (userid, password, registerstatus)
  VALUES
    ( 10300, 'teller1', 'Approved'),
    ( 10200, 'auditor1', 'Submitted'),
    ( 10100, 'admin1', 'Approved'),
     (10301, 'teller2', 'Approved'),
    ( 10302,'auditor3', 'Submitted');


 -- TypeSaving
  INSERT INTO typesaving (termperiod, interest)
  VALUES
  (0, 0.15),   -- không kỳ hạn
  (3, 0.5),   -- kỳ hạn 3 tháng
  (6, 0.55),   -- kỳ hạn 6 tháng
  (3, 0.5),  -- kỳ hạn 3 tháng
  (6, 0.15);  -- ko kỳ hạn


 --Customer
 INSERT INTO customer (fullname, citizenid, street, district, province)
  VALUES
  ('Nguyen Thi Hoa', '012345678901', 'Le Loi', '1', 'HCM'),
  ('Tran Van Minh', '098765432109', 'Hai Ba Trung', '3', 'HCM'),
  ('Le Thi Lan', '011223344556', 'Nguyen Trai', '5', 'Ha Noi'),
  ('Pham Van Kien', '099887766554', 'Ly Thuong Kiet', '10', 'Da Nang'),
  ('Hoang Thi Mai', '022334455667', 'Phan Chu Trinh', '7', 'HCM');


 --SavingBook
  INSERT INTO savingbook (typeid, customerid, registertime, maturitydate, status)
  VALUES
  (1, 1, '2025-02-10', '2025-05-10', 'Open'),
  (3, 2, '2025-03-01', '2025-09-01', 'Open'),
  (4, 3, '2025-04-15', '2026-04-15', 'Close'),
  (2, 4, '2025-06-20', '2025-09-20', 'Open'),
  (5, 5, '2025-07-05', '2027-07-05', 'Open');
      UPDATE savingbook
      Set closetime = NULL,
          currentbalance = 50000000
      where bookid = 1;
     UPDATE savingbook
      Set closetime = NULL,
          currentbalance = 25000000
      where bookid = 2;
      UPDATE savingbook
      Set closetime = '2026-04-15',
          currentbalance = 0
      where bookid = 3;
      UPDATE savingbook
      Set closetime = NULL,
          currentbalance = 50000000
      where bookid = 4;
      UPDATE savingbook
      Set closetime = NULL,
          currentbalance = 50000000
      where bookid = 5;
 --Transaction
 INSERT INTO transaction (bookid, transactiontype, amount, note)
  VALUES
  (1, 'Deposit', 5000000, 'Initial deposit'),
  (1, 'Deposit', 2000000, 'Monthly saving'),
  (2, 'Deposit', 10000000, 'First deposit'),
  (3, 'WithDraw', 3000000, 'Closed account'),
  (4, 'Deposit', 7000000, 'First deposit'),
  (5, 'Deposit', 20000000, 'New saving'),
  (2, 'WithDraw', 2000000, 'Partial withdrawal');


--Query Mock
SELECT * FROM role;
SELECT * FROM useraccount;
SELECT * FROM employee;
SELECT * FROM typesaving;
SELECT * FROM customer;
SELECT * FROM savingbook;
SELECT t.transactionid, t.bookid, t.transactiontype, t.amount, to_char (t.transactiondate, 'YYYY-MM-DD HH:MI:SS') as transaction_date, t.note
FROM transaction t;